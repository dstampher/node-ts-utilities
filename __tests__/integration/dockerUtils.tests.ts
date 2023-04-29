import { dockerUtils } from "../../src/index";

test("dockerUtils.buildImageIfNotExists", async () => {
  await dockerUtils.checkIfImageExists("test-image");
});
