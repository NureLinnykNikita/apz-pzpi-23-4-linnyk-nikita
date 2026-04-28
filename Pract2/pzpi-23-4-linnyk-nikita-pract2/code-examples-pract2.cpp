Використаний ШІ: ChatGPT, GPT-5 model
        Запити до ШІ:
        - Наведи приклад коду реалізаці DOD мовою C++ 
  
В.1 DOD (C++): структура даних 
struct Belts {
    std::vector<float> x, y, v;
    std::vector<bool> active;


    Belts(size_t capacity) {
        x.reserve(capacity);
        y.reserve(capacity);
        v.reserve(capacity);
        active.reserve(capacity);
    }


    void add(float px, float py, float vel) {
        x.push_back(px);
        y.push_back(py);
        v.push_back(vel);
        active.push_back(true);
    }


    size_t size() const { return x.size(); }
};


В.2 DOD (C++): обробка 
void update(Belts& b, float dt) {
    size_t n = b.size();


    for (size_t i = 0; i < n; ++i) {
        if (!b.active[i]) continue;
        b.x[i] += b.v[i] * dt;
    }
}
