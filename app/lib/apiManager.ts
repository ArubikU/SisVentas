import { Bill, Client, Deposit, Product, User } from './db/interfaces';

export class ApiManager {
  public key: string;

  constructor(key: string) {
    this.key = key;
  }
  

  public async fetchWithAuth(endpoint: string, method: string = 'POST', originalBody?: any) {
    const body = { ...originalBody, key: this.key }
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Error in API call to ${endpoint}:`, error);
      throw new Error(error + " route: " + endpoint + " method: " + method + " body: " + JSON.stringify(body));
    }
  }

  // Users
  async getUsers() {
    return this.fetchWithAuth('users');
  }

  async createUser(user: User) {
    return this.fetchWithAuth('users', 'POST', user);
  }

  async updateUser(user: User) {
    return this.fetchWithAuth(`users/${user.id}`, 'PUT', user);
  }

  async isPassword(user: User,password: string) {
    return this.fetchWithAuth(`login`, 'POST', {password: password, email: user.email});
  } 

  async deleteUser(userId: string) {
    return this.fetchWithAuth(`users/${userId}`, 'DELETE');
  }

  // Bills
  async getBills() {
    return this.fetchWithAuth('bills');
  }

  async createBill(boleta: Bill) {
    return this.fetchWithAuth('bills', 'POST', boleta);
  }

  async updateBill(boleta: Bill) {
    return this.fetchWithAuth(`bills/${boleta.id}`, 'PUT', boleta);
  }

  async deleteBill(boletaId: string) {
    return this.fetchWithAuth(`bills/${boletaId}`, 'DELETE');
  }

  async getBillsByClientId(clientid: string) {
    return this.fetchWithAuth(`bills/cliente/${clientid}`);
  }

  async changePassword(targetUser: string, newPassword: string) {
    return this.fetchWithAuth('users/password', 'POST', {
      targetUser,
      newPassword,
    });
  }
  

  // Deposits
  async getDeposits() {
    return this.fetchWithAuth('deposits');
  }

  async createDeposit(deposito: Deposit) {
    return this.fetchWithAuth('deposits', 'POST', deposito);
  }

  async updateDeposit(deposito: Deposit) {
    return this.fetchWithAuth(`deposits/${deposito.id}`, 'PUT', deposito);
  }

  async deleteDeposit(depositoId: string) {
    return this.fetchWithAuth(`deposits/${depositoId}`, 'DELETE');
  }

  async getDepositsByClientId(clientid: string) {
    return this.fetchWithAuth(`deposits/cliente/${clientid}`);
  }

  // Clients
  async getClients() {
    return this.fetchWithAuth('clients');
  }

  async createClient(cliente: Client) {
    return this.fetchWithAuth('clients', 'POST', cliente);
  }

  async updateClient(cliente: Client) {
    return this.fetchWithAuth(`clients/${cliente.id}`, 'PUT', cliente);
  }

  async deleteClient(clientid: string) {
    return this.fetchWithAuth(`clients/${clientid}`, 'DELETE');
  }

  // Products
  async getProducts() {
    return this.fetchWithAuth('products');
  }

  async createProduct(producto: Product) {
    return this.fetchWithAuth('products', 'POST', producto);
  }

  async updateProduct(producto: Product) {
    return this.fetchWithAuth(`products/${producto.id}`, 'PUT', producto);
  }

  async deleteProduct(productId: string) {
    return this.fetchWithAuth(`products/${productId}`, 'DELETE');
  }

  // Otras funciones
  async getClientBalance(clientid: string) {
    return this.fetchWithAuth(`clients/${clientid}/balance`);
  }

  async searchBills(query: string) {
    return this.fetchWithAuth(`bills/search`, 'POST', { query });
  }

  async searchDeposits(query: string) {
    return this.fetchWithAuth(`deposits/search`, 'POST', { query });
  }

  async getBillsByDateRange(startDate: Date, endDate: Date) {
    return this.fetchWithAuth(`bills/range`, 'POST', { start: startDate.toISOString(), end: endDate.toISOString() });
  }

  async getDepositsByDateRange(startDate: Date, endDate: Date) {
    return this.fetchWithAuth(`deposits/range`, 'POST', { start: startDate.toISOString(), end: endDate.toISOString() });
  }
}

// Debug set
const DEBUG = false;

if (DEBUG) {
  console.log('Debug mode enabled: All API requests will fail');
}

export function useApi(key: string) {
  if (DEBUG) {
    return {
      getUsers: async () => { throw new Error('Simulated API failure'); },
      createUser: async () => { throw new Error('Simulated API failure'); },
      updateUser: async () => { throw new Error('Simulated API failure'); },
      deleteUser: async () => { throw new Error('Simulated API failure'); },
      getBills: async () => { throw new Error('Simulated API failure'); },
      createBill: async () => { throw new Error('Simulated API failure'); },
      updateBill: async () => { throw new Error('Simulated API failure'); },
      deleteBill: async () => { throw new Error('Simulated API failure'); },
      getDeposits: async () => { throw new Error('Simulated API failure'); },
      createDeposit: async () => { throw new Error('Simulated API failure'); },
      updateDeposit: async () => { throw new Error('Simulated API failure'); },
      deleteDeposit: async () => { throw new Error('Simulated API failure'); },
      getClients: async () => { throw new Error('Simulated API failure'); },
      createClient: async () => { throw new Error('Simulated API failure'); },
      updateClient: async () => { throw new Error('Simulated API failure'); },
      deleteClient: async () => { throw new Error('Simulated API failure'); },
      getProducts: async () => { throw new Error('Simulated API failure'); },
      createProduct: async () => { throw new Error('Simulated API failure'); },
      updateProduct: async () => { throw new Error('Simulated API failure'); },
      deleteProduct: async () => { throw new Error('Simulated API failure'); },
      getClientBalance: async () => { throw new Error('Simulated API failure'); },
      searchBills: async () => { throw new Error('Simulated API failure'); },
      searchDeposits: async () => { throw new Error('Simulated API failure'); },
      getBillsByDateRange: async () => { throw new Error('Simulated API failure'); },
      getDepositsByDateRange: async () => { throw new Error('Simulated API failure'); },
    };
  }
  return new ApiManager(key);
}

