
exports.directions = function(){
   return {
       n: { x: -1, y: 0 },
      ne: { x: -1, y: 1 },
       e: { x:  0, y: 1 },
      se: { x:  1, y: 1 },
       s: { x:  1, y: 0 },
      sw: { x:  1, y: -1},
       w: { x:  0, y: -1},
      nw: { x: -1, y: -1}
   }
}
