import {atom, RecoilState} from "recoil";

const isLoggedState: RecoilState<boolean> = atom<boolean>({
    key: 'isLoggedState', // unique ID (with respect to other atoms/selectors)
    default: true
});

export default isLoggedState;