import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { AuthenticatedUserData, Bill, Client, DatabaseInterface, Deposit, Product, User } from "./interfaces"

export class SupabaseImplementation implements DatabaseInterface {
  private supabase: SupabaseClient

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log("Supabase URL and Key must be provided in environment variables")
      throw new Error("Supabase URL and Key must be provided in environment variables")
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.ensureAdminUser()
  }
  async changuePassword(key: string, targetUser: string, newPassword: string): Promise<void> {
    const isAdmin = await this.checkAuthorization(key, "administrator");
    const isSameUser = key === targetUser;

    if (!isAdmin && !isSameUser) {
      throw new Error("Unauthorized");
    }

    const { error } = await this.supabase
      .from("users")
      .update({ password: newPassword })
      .eq("id", targetUser);

    if (error) {
      console.error("Error updating password:", error);
      throw new Error("Failed to change password");
    }

    console.log("Password updated successfully for user", targetUser);
  }


  private async ensureAdminUser(): Promise<void> {
    try {
      const { data: admins, error } = await this.supabase
        .from("users")
        .select("count")
        .eq("email", "admin@example.com")
        .single()

      if (error) throw error

      if (admins.count === 0) {
        console.log("No admin user found. Creating default admin user...")
        const { error: insertError } = await this.supabase
          .from("users")
          .insert({ id: this.generateId(),email: "admin@example.com", password: "adminpassword", tier: "administrator" })
          

        if (insertError) throw insertError
        console.log("Default admin user created.")
      }
    } catch (error) {
      console.error("Error ensuring admin user:", error)
    }
  }

  async isValidUser(key: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("users")
      .select("id")
      .eq("id", key)
      .single()

    if (error || !data) return false
    return true
  }

  async getData(key: string): Promise<AuthenticatedUserData | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", key)
      .single()

    if (error || !data) return null

    return {
      email: data.email,
      tier: data.tier,
    }
  }

  async login(email: string, password: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single()
    if (error || !data) return null
    return data.id
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private async checkAuthorization(
    key: string,
    requiredLevel: "basic" | "advanced" | "administrator",
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("users")
      .select("tier")
      .eq("id", key)
      .single()

    if (error || !data) return false

    const levels = ["basic", "advanced", "administrator"]
    return levels.indexOf(data.tier) >= levels.indexOf(requiredLevel)
  }

  async getUsers(key?: string): Promise<User[]> {
    if (key && !(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase.from("users").select(key ? "*" : "id, email, tier")
    if (error) throw error
    return data as unknown as User[]
  }

  async createUser(key: string, user: User): Promise<void> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("users").insert(user)
    if (error) throw error
  }

  async updateUser(key: string, user: User): Promise<void> {
    const isAdmin = await this.checkAuthorization(key, "administrator")
    const isSameUser = key === user.id

    if (!isAdmin && !isSameUser) throw new Error("Unauthorized")
    
    const { error } = await this.supabase
      .from("users")
      .update({
        email: user.email,
        tier: isAdmin ? user.tier : undefined, // Only admin can update tier
        password: user.password,
      })
      .eq("id", user.id)

    if (error) throw error
  }

  async deleteUser(key: string, userId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("users").delete().eq("id", userId)
    if (error) throw error
  }

  async getBills(key: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase.from("bills").select("*")
    if (error) throw error
    return data
  }

  async createBill(key: string, bill: Bill): Promise<void> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("bills").insert(bill)
    if (error) throw error
  }

  async updateBill(key: string, bill: Bill): Promise<void> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("bills").update(bill).eq("id", bill.id)
    if (error) throw error
  }

  async deleteBill(key: string, billId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("bills").delete().eq("id", billId)
    if (error) throw error
  }

  async getBillsByClientId(key: string, clientid: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase.from("bills").select("*").eq("clientid", clientid)
    if (error) throw error
    return data
  }

  async getDeposits(key: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase.from("deposits").select("*")
    if (error) throw error
    return data
  }

  async createDeposit(key: string, deposit: Deposit): Promise<void> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("deposits").insert(deposit)
    if (error) throw error
  }

  async updateDeposit(key: string, deposit: Deposit): Promise<void> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("deposits").update(deposit).eq("id", deposit.id)
    if (error) throw error
  }

  async deleteDeposit(key: string, depositId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("deposits").delete().eq("id", depositId)
    if (error) throw error
  }

  async getDepositsByClientId(key: string, clientid: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase.from("deposits").select("*").eq("clientid", clientid)
    if (error) throw error
    return data
  }

  async getClients(key: string): Promise<Client[]> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase.from("clients").select("*")
    if (error) throw error
    return data
  }

  async createClient(key: string, client: Client): Promise<void> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("clients").insert(client)
    if (error) throw error
  }

  async updateClient(key: string, client: Client): Promise<void> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("clients").update(client).eq("id", client.id)
    if (error) throw error
  }

  async deleteClient(key: string, clientid: string): Promise<void> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("clients").delete().eq("id", clientid)
    if (error) throw error
  }

  async getProducts(key: string): Promise<Product[]> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase.from("products").select("*")
    if (error) throw error
    return data
  }

  async createProduct(key: string, producto: Product): Promise<void> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("products").insert(producto)
    if (error) throw error
  }

  async updateProduct(key: string, producto: Product): Promise<void> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("products").update(producto).eq("id", producto.id)
    if (error) throw error
  }

  async deleteProduct(key: string, productId: string): Promise<void> {
    if (!(await this.checkAuthorization(key, "administrator"))) throw new Error("Unauthorized")
    const { error } = await this.supabase.from("products").delete().eq("id", productId)
    if (error) throw error
  }

  async getClientBalance(key: string, clientid: string): Promise<number> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data: bills, error: billsError } = await this.supabase
      .from("bills")
      .select("products")
      .eq("clientid", clientid)
    if (billsError) throw billsError

    const { data: deposits, error: depositsError } = await this.supabase
      .from("deposits")
      .select("amount")
      .eq("clientid", clientid)
    if (depositsError) throw depositsError

    const totalBills = bills.reduce((total, bill) => {
      return (
        total +
        Object.values(bill.products as Record<string, { amount: number; price: number }>).reduce(
          (subtotal, producto) => {
          return subtotal + producto.amount * producto.price
          },
          0
        )
      )
    }, 0)

    const totalDeposits = deposits.reduce((total, deposit) => total + deposit.amount, 0)

    return totalBills - totalDeposits
  }

  async searchBills(key: string, query: string): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase
      .from("bills")
      .select("*")
      .or(`identifier.ilike.%${query}%,clientid.ilike.%${query}%`)
    if (error) throw error
    return data
  }

  async searchDeposits(key: string, query: string): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase
      .from("deposits")
      .select("*")
      .or(`identifier.ilike.%${query}%,clientid.ilike.%${query}%,operationcode.ilike.%${query}%`)
    if (error) throw error
    return data
  }

  async getBillsByDateRange(key: string, startDate: Date, endDate: Date): Promise<Bill[]> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase
      .from("bills")
      .select("*")
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())
    if (error) throw error
    return data
  }

  async getDepositsByDateRange(key: string, startDate: Date, endDate: Date): Promise<Deposit[]> {
    if (!(await this.checkAuthorization(key, "basic"))) throw new Error("Unauthorized")
    const { data, error } = await this.supabase
      .from("deposits")
      .select("*")
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())
    if (error) throw error
    return data
  }
}

