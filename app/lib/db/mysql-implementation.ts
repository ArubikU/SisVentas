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

import mysql from 'mysql2/promise';
import { AuthenticatedUserData, Bill, Client, DatabaseInterface, Deposit, Product, User } from './interfaces';

export class MySQLImplementation implements DatabaseInterface {
  private pool: mysql.Pool

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
    this.ensureAdminUser();
    this.debug();
  }

  async debug(): Promise<void> {
    const tables = ['users', 'bills', 'deposits', 'clients', 'products'];
    const databaseDump: Record<string, any[]> = {};

    for (const table of tables) {
      const data = await this.query(`SELECT * FROM ${table}`, []);
      databaseDump[table] = data;
    }

    console.log(JSON.stringify(databaseDump, null, 2));
  }

  private async query(sql: string, params: any[]): Promise<any> {
    const [rows] = await this.pool.execute(sql, params)
    return rows
  }
  
  private async ensureAdminUser(): Promise<void> {
    try {
      const [admins] = await this.query('SELECT COUNT(*) as count FROM users WHERE email = ?', ['admin@icosta.pe']);
      if (admins.count === 0) {
        console.log('No admin user found. Creating default admin user...');
        await this.query(
          'INSERT INTO users (email, password, tier) VALUES (?, ?, ?)',
          ['admin@icosta.pe', 'adminlocal', 'administrator']
        );
        console.log('Default admin user created.');
      }
    } catch (error) {
      console.error('Error ensuring admin user:', error);
    }
  }

  async isValidUser(key: string): Promise<boolean> {
    const [user] = await this.query('SELECT * FROM users WHERE api_key = ?', [key])
    return !!user
  }

  async getData(key: string): Promise<AuthenticatedUserData | null> {
    const [user] = await this.query('SELECT email, tier FROM users WHERE api_key = ?', [key])
    return user ? { userName: user.email, tier: user.tier } : null
  }

  async login(email: string, password: string): Promise<string | null> {
    const [user] = await this.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password])
    if (user) {
      const apiKey = this.generateKey(user)
      await this.query('UPDATE users SET api_key = ? WHERE id = ?', [apiKey, user.id])
      return apiKey
    }
    return null
  }

  private generateKey(user: User): string {
    const tempHash = hash256(user.email.toLowerCase() + user.password);
    return encryptOperation(tempHash);
  }

  private generateApiKey(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private async checkAuthorization(key: string, requiredLevel: 'basic' | 'advanced' | 'administrator'): Promise<boolean> {
    const userData = await this.getData(key);
    
    if (!userData) return false;
    
    const levels = ['basic', 'advanced', 'administrator'];
    return levels.indexOf(userData.tier) >= levels.indexOf(requiredLevel);
  }

  async getUsers(key?: string): Promise<User[]> {
    if (key && !(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM users', [])
  }

  async createUser(key: string, user: User): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('INSERT INTO users (id, email, password, tier) VALUES (?, ?, ?, ?)', [user.id, user.email, user.password, user.tier])
  }

  async updateUser(key: string, user: User): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('UPDATE users SET email = ?, password = ?, tier = ? WHERE id = ?', [user.email, user.password, user.tier, user.id])
  }

  async deleteUser(key: string, userId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('DELETE FROM users WHERE id = ?', [userId])
  }

  async getBills(key: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM bills', [])
  }

  async createBill(key: string, bill: Bill): Promise<void> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    await this.query('INSERT INTO bills (id, clientid, products, date, identifier) VALUES (?, ?, ?, ?, ?)', 
      [bill.id, bill.clientid, JSON.stringify(bill.products), bill.date, bill.identifier])
  }

  async updateBill(key: string, bill: Bill): Promise<void> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    await this.query('UPDATE bills SET clientid = ?, products = ?, date = ?, identifier = ? WHERE id = ?', 
      [bill.clientid, JSON.stringify(bill.products), bill.date, bill.identifier, bill.id])
  }

  async deleteBill(key: string, billId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    await this.query('DELETE FROM bills WHERE id = ?', [billId])
  }

  async getBillsByClientId(key: string, clientid: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM bills WHERE clientid = ?', [clientid])
  }

  async getDeposits(key: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM deposits', [])
  }

  async createDeposit(key: string, deposit: Deposit): Promise<void> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    await this.query('INSERT INTO deposits (id, clientid, currency, changueamount, amount, operationcode, identifier, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [deposit.id, deposit.clientid, deposit.currency, deposit.changueamount, deposit.amount, deposit.operationcode, deposit.identifier, deposit.date])
  }

  async updateDeposit(key: string, deposit: Deposit): Promise<void> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    await this.query('UPDATE deposits SET clientid = ?, currency = ?, changueamount = ?, amount = ?, operationcode = ?, identifier = ?, date = ? WHERE id = ?', 
      [deposit.clientid, deposit.currency, deposit.changueamount, deposit.amount, deposit.operationcode, deposit.identifier, deposit.date, deposit.id])
  }

  async deleteDeposit(key: string, depositId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    await this.query('DELETE FROM deposits WHERE id = ?', [depositId])
  }

  async getDepositsByClientId(key: string, clientid: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM deposits WHERE clientid = ?', [clientid])
  }

  async getClients(key: string): Promise<Client[]> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM clients', [])
  }

  async createClient(key: string, client: Client): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('INSERT INTO clients (id, name, prices) VALUES (?, ?, ?)', 
      [client.id, client.name, JSON.stringify(client.prices)])
  }

  async updateClient(key: string, client: Client): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('UPDATE clients SET name = ?, prices = ? WHERE id = ?', 
      [client.name, JSON.stringify(client.prices), client.id])
  }

  async deleteClient(key: string, clientid: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('DELETE FROM clients WHERE id = ?', [clientid])
  }

  async getProducts(key: string): Promise<Product[]> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM products', [])
  }

  async createProduct(key: string, producto: Product): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('INSERT INTO products (id, name, genericprice) VALUES (?, ?, ?)', 
      [producto.id, producto.name, producto.genericprice])
  }

  async updateProduct(key: string, producto: Product): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('UPDATE products SET name = ?, genericprice = ? WHERE id = ?', 
      [producto.name, producto.genericprice, producto.id])
  }

  async deleteProduct(key: string, productId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, 'administrator'))) throw new Error('Unauthorized')
    await this.query('DELETE FROM products WHERE id = ?', [productId])
  }

  async getClientBalance(key: string, clientid: string): Promise<number> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    const [result] = await this.query(`
      SELECT 
        COALESCE(SUM(b.total), 0) - COALESCE(SUM(d.amount), 0) as balance
      FROM 
        (SELECT clientid, SUM(JSON_EXTRACT(products, '$[*].price') * JSON_EXTRACT(products, '$[*].amount')) as total
         FROM bills 
         WHERE clientid = ?
         GROUP BY clientid) b
      LEFT JOIN
        (SELECT clientid, SUM(amount) as amount
         FROM deposits
         WHERE clientid = ?
         GROUP BY clientid) d
      ON b.clientid = d.clientid
    `, [clientid, clientid])
    return result ? result.balance : 0
  }

  async searchBills(key: string, query: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM bills WHERE identifier LIKE ? OR clientid LIKE ?', [`%${query}%`, `%${query}%`])
  }

  async searchDeposits(key: string, query: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM deposits WHERE identifier LIKE ? OR clientid LIKE ? OR operationcode LIKE ?', 
      [`%${query}%`, `%${query}%`, `%${query}%`])
  }

  async getBillsByDateRange(key: string, startDate: Date, endDate: Date): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM bills WHERE date BETWEEN ? AND ?', [startDate, endDate])
  }

  async getDepositsByDateRange(key: string, startDate: Date, endDate: Date): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, 'basic'))) throw new Error('Unauthorized')
    return this.query('SELECT * FROM deposits WHERE date BETWEEN ? AND ?', [startDate, endDate])
  }
}

