export interface IDockerConfiguration {
  containerRegistry?: string;
  dockerTag?: string;
  //dockerRepository?: string;
  dockerUsername?: string;
  dockerPassword?: string;
}

export class DockerConfiguration implements IDockerConfiguration {
  constructor(
    public containerRegistry?: string,
    public dockerTag?: string,
    //public dockerRepository?: string,
    public dockerUsername?: string,
    public dockerPassword?: string
  ) {}
}
