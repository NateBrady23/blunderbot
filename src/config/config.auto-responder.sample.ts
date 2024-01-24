/**
 * Not required
 *
 *  For each group, if a message matches one of the phrases, BlunderBot will respond automatically
 *  Use regular expressions for the phrases. They'll be case insensitive and match anywhere in the message.
 *  If the response begins with a "!", BlunderBot will run that command instead of sending a message.
 *  NOTE: Only the first matching group will be used.
 */
const userAutoResponderConfig: UserAutoResponderConfig = [
  {
    // Match any of these regular expressions to respond
    phrases: ['what.*(is|does|stand|mean).*bm'],
    responses: ['!bm']
  },
  {
    phrases: ['^nice'],
    responses: ['nice']
  },
  {
    phrases: ['1v1( .*)? me', '^wan.* play( .*)? me'],
    responses: ["1v1 me bro, I'll crush you", '!challenge']
  },
  {
    phrases: [
      '(you|u) miss(ed)?( .*)free( .*)(queen|bishop|knight|pawn|rook)',
      '(you|u) miss(ed)?( .*)mate'
    ],
    responses: [
      "BM Nate Brady doesn't miss anything! He was just testing the chat to see if they're good enough to watch his games."
    ]
  },
  {
    phrases: ['^(ggs?)|(good game)$'],
    responses: ['gee gee!']
  }
];

export default userAutoResponderConfig;
