import {atom, RecoilState} from "recoil";

const guildState: RecoilState<Guild | null> = atom<Guild | null>({
    key: 'guildState', // unique ID (with respect to other atoms/selectors)
    default: null
});

export default guildState;