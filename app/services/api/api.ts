/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { getGeneralApiProblem } from "./apiProblem" // @demo remove-current-line
import type { ApiConfig } from "./api.types"
import { GetDataResult } from "./api.types"
import * as Device from "expo-device"
import UserAgent from "react-native-user-agent"
/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * email: tokenize.test@gmail.com,
   * password: Test#111,
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.setup()
  }

  async setup() {
    const agent = await UserAgent.getUserAgent()
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=utf-8",
        "user-agent": agent,
        "TOK-DEVICE-ID": Device.osInternalBuildId,
      },
    })
  }

  async processData(response: ApiResponse<any>): Promise<GetDataResult> {
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    try {
      const data = response.data
      if (data.code === 200 || data) {
        return { kind: "ok", data: data }
      } else {
        return { kind: "bad-data", data: data?.message }
      }
    } catch {
      const data = response.data
      if (data.code === 200 || data) {
        return { kind: "ok", data: data }
      } else {
        return { kind: "bad-data", data: data?.message }
      }
    }
  }

  async doLogin(data: any): Promise<GetDataResult> {
    const response: ApiResponse<any> = await this.apisauce.post("mobile-api/auth/login", {
      ...data,
      captcha: "yWOEjZMIhY",
      captchaBypass: "yWOEjZMIhY",
    })
    return this.processData(response)
  }

  async getMarkets(): Promise<GetDataResult> {
    const response: ApiResponse<any> = await this.apisauce.get("mobile-api/market/getmarkets")
    return this.processData(response)
  }

  async getSum(): Promise<GetDataResult> {
    const response: ApiResponse<any> = await this.apisauce.get("public/v1/market/get-summaries")
    return this.processData(response)
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
