export const getTokenExpTimeoutName = (token: string) => {
    const tokenName = `remove_token_timeout_Token:${token.slice(0, 20)}`;
    return tokenName;
};
