import { testProxy } from "../../src/netUtils";
import axios from "axios";
test("Test a valid proxy", async () => {
  let proxy = "http://localhost:8888";
  let result = await testProxy(
    axios.create(),
    proxy,
    "http://ip-api.com/json",
    "Santa Maria"
  );
  expect(result).toBe(true);
});
