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
  let proxyAgent = new HttpsProxyAgent(proxy);
  let res = await axios.get<string>(url, {
    httpsAgent: proxyAgent,
    responseType: "text",
  });
  console.log(res.data);
  //Check for expected or disallowed value.
  let result: boolean = false;
  if (expectedValue) result = res.data.includes(expectedValue);
  if (disallowedValue) result = !res.data.includes(disallowedValue);
  return result;
}
