// Implementación temporal usando un mapa de JSONs
import { AuthenticatedUserData, Bill, Client, DatabaseInterface, Deposit, Product, User } from './interfaces';


// Funciones de hash y encriptación
function hash256(data: string): string {
  return data;
  //return crypto.createHash('sha256').update(data).digest('hex');
}

function encryptOperation(value: string): string {
  // Esta es una implementación simplificada. En un entorno de producción,
  // se debería usar un algoritmo de encriptación más robusto.
  return value; //.split('').map(char => char.charCodeAt(0) + 234).join('u');
}

export class JSONImplementation implements DatabaseInterface {
  private data: {
    users: User[]
    bills: Bill[]
    deposits: Deposit[]
    clients: Client[]
    products: Product[]
  }

  constructor() {
    this.data = {
      users: [
        { id: '1', email: 'admin@example.com', password: 'admin123', tier: 'administrator' },
        { id: '2', email: 'user@example.com', password: 'user123', tier: 'basic' },
      ],
      bills: [],
      deposits: [],
      clients: [
        { id: '1', name: 'Client A', prices: {} },
        { id: '2', name: 'Client B', prices: {} },
      ],
      products: [
        { id: '1', name: 'Product 1', genericprice: 100 },
        { id: '2', name: 'Product 2', genericprice: 200 },
      ]
    }
  }

  private generateKey(user: User): string {
    const tempHash = hash256(user.email.toLowerCase() + user.password);
    return encryptOperation(tempHash);
  }


  async getData(key: string): Promise<AuthenticatedUserData | null> {
    for (const user of this.data.users) {
      const userKey = this.generateKey(user);
      if (userKey === key) {
        return { userName: user.email, tier: user.tier };
      }
    }
    return null;
  }
  async isValidUser(key: string): Promise<boolean> {
    const data = await this.getData(key);
    return data !== null;
  }

  async login(email: string, password: string): Promise<string | null> {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      const key = this.generateKey(user);
      return key;
    }
    return null;
  }

  private async checkAuthorization(key: string, requiredLevel: 'basic' | 'advanced' | 'administrator'): Promise<boolean> {
    const userData = await this.getData(key);
    
    if (!userData) return false;
    
    const levels = ['basic', 'advanced', 'administrator'];
    return levels.indexOf(userData.tier) >= levels.indexOf(requiredLevel);
  }

  async getUsers(key?: string): Promise<User[]> {
    // Allow access without a key for the login process
    if (!key) {
      return this.data.users;
    }
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    return this.data.users;
  }

  async createUser(key: string, user: User): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    this.data.users.push(user);
  }

  async updateUser(key: string, user: User): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    const index = this.data.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.data.users[index] = user;
    }
  }

  async deleteUser(key: string, userId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    this.data.users = this.data.users.filter(u => u.id !== userId);
  }

  async getBills(key: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized');
    return this.data.bills;
  }

  async createBill(key: string, bill: Bill): Promise<void> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized');
    bill.identifier = `BOL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    this.data.bills.push(bill);
  }

  async updateBill(key: string, bill: Bill): Promise<void> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    const index = this.data.bills.findIndex(b => b.id === bill.id);
    if (index !== -1) {
      this.data.bills[index] = bill;
    }
  }

  async deleteBill(key: string, billId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    this.data.bills = this.data.bills.filter(b => b.id !== billId);
  }

  async getBillsByClientId(key: string, clientid: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized');
    return this.data.bills.filter(b => b.clientid === clientid);
  }

  async getDeposits(key: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    return this.data.deposits;
  }

  async createDeposit(key: string, deposit: Deposit): Promise<void> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    this.data.deposits.push(deposit);
  }

  async updateDeposit(key: string, deposit: Deposit): Promise<void> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    const index = this.data.deposits.findIndex(d => d.id === deposit.id);
    if (index !== -1) {
      this.data.deposits[index] = deposit;
    }
  }

  async deleteDeposit(key: string, depositId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    this.data.deposits = this.data.deposits.filter(d => d.id !== depositId);
  }

  async getDepositsByClientId(key: string, clientid: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    return this.data.deposits.filter(d => d.clientid === clientid);
  }

  async getClients(key: string): Promise<Client[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized');
    return this.data.clients;
  }

  async createClient(key: string, client: Client): Promise<void> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    this.data.clients.push(client);
  }

  async updateClient(key: string, client: Client): Promise<void> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    const index = this.data.clients.findIndex(c => c.id === client.id);
    if (index !== -1) {
      this.data.clients[index] = client;
    }
  }

  async deleteClient(key: string, clientid: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    this.data.clients = this.data.clients.filter(c => c.id !== clientid);
  }

  async getProducts(key: string): Promise<Product[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized');
    return this.data.products;
  }

  async createProduct(key: string, producto: Product): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    this.data.products.push(producto);
  }

  async updateProduct(key: string, producto: Product): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    const index = this.data.products.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.data.products[index] = producto;
    }
  }

  async deleteProduct(key: string, productId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized');
    this.data.products = this.data.products.filter(p => p.id !== productId);
  }

  async getClientBalance(key: string, clientid: string): Promise<number> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    const bills = await this.getBillsByClientId(key, clientid);
    const deposits = await this.getDepositsByClientId(key, clientid);

    const totalBills = bills.reduce((total, bill) => {
      return total + Object.values(bill.products).reduce((subtotal, productoArray) => {
        return subtotal + productoArray.reduce((productoTotal, producto) => {
          return productoTotal + (producto.amount * producto.price);
        }, 0);
      }, 0);
    }, 0);

    const totalDeposits = deposits.reduce((total, deposit) => {
      return total + deposit.amount;
    }, 0);

    return totalBills - totalDeposits;
  }

  async searchBills(key: string, query: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized');
    const lowercaseQuery = query.toLowerCase();
    return this.data.bills.filter(bill => 
      bill.identifier.toLowerCase().includes(lowercaseQuery) ||
      bill.clientid.toLowerCase().includes(lowercaseQuery)
    );
  }

  async searchDeposits(key: string, query: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    const lowercaseQuery = query.toLowerCase();
    return this.data.deposits.filter(deposit => 
      deposit.identifier?.toLowerCase().includes(lowercaseQuery) ||
      deposit.clientid.toLowerCase().includes(lowercaseQuery) ||
      deposit.operationcode?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getBillsByDateRange(key: string, startDate: Date, endDate: Date): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    return this.data.bills.filter(bill => {
      const billDate = new Date(bill.date);
      return billDate >= startDate && billDate <= endDate;
    });
  }

  async getDepositsByDateRange(key: string, startDate: Date, endDate: Date): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, 'advanced'))) throw new Error('Unauthorized');
    return this.data.deposits.filter(deposit => {
      const depositDate = new Date(deposit.date);
      return depositDate >= startDate && depositDate <= endDate;
    });
  }
}

