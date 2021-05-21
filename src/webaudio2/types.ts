






interface AudioNode {
    connect(destination : Destination, output?: number) : void;
    disconnect(destination? : Destination) : void;
}

type Destination = AudioNode | AudioParam
