import {atom} from "recoil";

const isInVoiceChannelState = atom({
    key: 'isInVoiceChannelState', // unique ID (with respect to other atoms/selectors)
    default: false
});

export default isInVoiceChannelState;