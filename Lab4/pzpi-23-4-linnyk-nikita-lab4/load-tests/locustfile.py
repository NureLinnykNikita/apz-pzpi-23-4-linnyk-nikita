from locust import HttpUser, between, task


class LangBangUser(HttpUser):
    wait_time = between(0.2, 1.2)

    def on_start(self):
        self.access_token = None
        response = self.client.post(
            "/api/login",
            json={
                "email": "admin@langbang.com",
                "password": "admin123",
            },
            name="POST /api/login",
        )

        if response.ok:
            self.access_token = response.json().get("accessToken")

    @task(5)
    def list_courses(self):
        self.client.get("/api/courses", name="GET /api/courses")

    @task(3)
    def list_languages(self):
        self.client.get("/api/languages", name="GET /api/languages")

    @task(2)
    def leaderboard(self):
        if not self.access_token:
            return

        self.client.get(
            "/api/leaderboard?period=all&limit=50",
            headers={"Authorization": f"Bearer {self.access_token}"},
            name="GET /api/leaderboard",
        )

    @task(1)
    def health(self):
        self.client.get("/health", name="GET /health")
