import { Axios } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

export async function testProxy(
  axios: Axios,
  proxy: string,
  url: string,
  expectedValue?: string,
  disallowedValue?: string
) {
  if (!expectedValue && !disallowedValue)
    throw new Error("Must provide expectedValue or disallowedValue");
  let result: boolean = false;
  let proxyAgent = new HttpsProxyAgent(proxy);
  try {
    let res = await axios.get<string>(url, {
      httpsAgent: proxyAgent,
      httpAgent: proxyAgent,
      responseType: "text",
    });
    if (expectedValue) result = res.data.includes(expectedValue);
    if (disallowedValue) result = !res.data.includes(disallowedValue);
  } catch (error) {
    console.log(error);
  }
  return result;
}
