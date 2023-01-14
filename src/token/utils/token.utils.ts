export const getTokenExpTimeoutName = (token: string) => {
    const tokenName = `remove_token_timeout_Token:${token}`;
    return tokenName;
};
