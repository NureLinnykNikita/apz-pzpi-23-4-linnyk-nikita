  Використаний ШІ: ChatGPT, GPT-5 model
  Запити до ШІ:
   * Наведи приклад коду мовою JS прикладного використання патерну Builder


  Програмний код:
class Computer {
     constructor() {
         this.cpu = "";
         this.ram = "";
         this.storage = "";
     }
 
     showSpecs() {
         console.log(`CPU: ${this.cpu}, RAM: ${this.ram}, Storage: ${this.storage}`);
     }
 }
 
 class ComputerBuilder {
     constructor() {
         this.computer = new Computer();
     }
 
     buildCPU() {}
     buildRAM() {}
     buildStorage() {}
 
     getComputer() {
         return this.computer;
     }
 }
 
 class GamingComputerBuilder extends ComputerBuilder {
     buildCPU() {
         this.computer.cpu = "Intel Core i9";
     }
 
     buildRAM() {
         this.computer.ram = "32GB DDR5";
     }
 
     buildStorage() {
         this.computer.storage = "2TB NVMe SSD";
     }
 }
 
 class Director {
     setBuilder(builder) {
         this.builder = builder;
     }
 
     constructComputer() {
         this.builder.buildCPU();
         this.builder.buildRAM();
         this.builder.buildStorage();
     }
 }
 
 const director = new Director();
 const builder = new GamingComputerBuilder();
 director.setBuilder(builder);
 director.constructComputer();
 const myPC = builder.getComputer();
 myPC.showSpecs();
