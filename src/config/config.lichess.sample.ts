/**
 * REQUIRED!
 */

// example https://lichess.org/account/oauth/token/create?scopes[]=preference:read,preference:write,email:read,challenge:read,challenge:write,challenge:bulk,study:read,study:write,tournament:write,racer:write,puzzle:read,team:read,team:write,team:lead,follow:read,follow:write,msg:write,board:play&description=natebrady23
const userLichessConfig: UserLichessConfig = {
  user: 'NateBrady23',
  oauthToken: 'lip_yourtoken',
  botOauthToken: 'lip_yourbottoken',
  teamId: 'bradys-blunder-buddies',
  teamName: "Brady's Blunder Buddies"
};

export default userLichessConfig;
