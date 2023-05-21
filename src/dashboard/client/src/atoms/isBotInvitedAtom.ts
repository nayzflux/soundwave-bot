import {atom, RecoilState} from "recoil";

const isLoggedBotInvitedState: RecoilState<boolean> = atom<boolean>({
    key: 'isLoggedBotInvitedState', // unique ID (with respect to other atoms/selectors)
    default: true
});

export default isLoggedBotInvitedState;