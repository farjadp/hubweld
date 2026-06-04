function stringHash(str) {
  let hash = 5381;
  let i = str.length;
  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return (hash >>> 0).toString();
}
console.log("DYNAMIC_SERVER_USAGE:", stringHash("DYNAMIC_SERVER_USAGE"));
console.log("NEXT_NOT_FOUND:", stringHash("NEXT_NOT_FOUND"));
console.log("NEXT_REDIRECT:", stringHash("NEXT_REDIRECT"));
