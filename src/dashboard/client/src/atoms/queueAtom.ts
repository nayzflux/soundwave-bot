import {atom, RecoilState} from "recoil";

const queueState: RecoilState<Queue> = atom<Queue>({
    key: 'queueState', // unique ID (with respect to other atoms/selectors)
    default: {
        isPlaying: false,
        songs: []
    }
});

export default queueState;