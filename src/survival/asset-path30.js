/** Shared static package paths; authoring banks live beside textures/, not in it. */
export function texturePath30(name){
 return 'assets/'+(name.includes('/')?name:'textures/'+name);
}
