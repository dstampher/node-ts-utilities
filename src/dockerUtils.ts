import Docker from "dockerode";
const docker = new Docker();

export async function execShellCommand(
  container: Docker.Container,
  command: string
) {
  let exec = await container.exec({
    Cmd: ["sh", "-c", command],
    AttachStdout: true,
    AttachStderr: true,
  });

  let stream = await exec.start({ hijack: true, stdin: false });
  //Wait until exec is done.
  await new Promise((resolve, reject) => {
    container.modem.demuxStream(stream, process.stdout, process.stderr);
    stream.on("end", resolve);
    stream.on("error", reject);
  });

  //Check if exec was successful
  let inspect = await exec.inspect();
  if (inspect.ExitCode !== 0) {
    throw new Error("Exec failed with exit code: " + inspect.ExitCode);
  }
}

async function checkIfImageExists(imageName: string) {
  try {
    const image = docker.getImage(imageName);
    await image.inspect();
    return true;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return false;
    }
    throw error;
  }
}

export async function buildImageIfNotExists(imageName: string) {
  const imageExists = await checkIfImageExists(imageName);
  if (!imageExists) {
    let stream = await docker.buildImage({
      context: "./",
      src: ["Dockerfile", "./data"],
    });
    //Wait until image is built.
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => {
        err ? reject(err) : resolve(res);
      });
    });
  }
}

export function createExposedPortsValue(startPort: number, count: number) {
  let exposedPorts: any = {};
  let endPort = startPort + count;
  for (let i = startPort; i < endPort; i++) {
    exposedPorts[`${i}/tcp`] = {};
  }
  return exposedPorts;
}

export async function getPortMap(container: Docker.Container) {
  let inspect = await container.inspect();
  let ports = inspect.NetworkSettings.Ports;
  let portMap: PortMap[] = [];
  for (const key in ports) {
    let containerPort = key.split("/")[0];
    let hostPort = ports[key][0].HostPort;
    portMap.push({
      containerPort: parseInt(containerPort),
      hostPort: parseInt(hostPort),
      inUse: false,
    });
  }
  return portMap;
}

export type PortMap = {
  containerPort: number;
  hostPort: number;
  inUse: boolean;
};
