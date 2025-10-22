/**
 * 检查 IPC API 是否可用
 */

export function checkIPCAvailability() {
  console.log('[IPC Check] window.ipc:', window.ipc);
  console.log('[IPC Check] window.ipc?.folder:', window.ipc?.folder);
  console.log('[IPC Check] window.ipc?.note:', window.ipc?.note);
  console.log('[IPC Check] window.ipc?.tag:', window.ipc?.tag);
  
  if (!window.ipc) {
    console.error('[IPC Check] window.ipc is undefined! Preload script may not have loaded.');
    return false;
  }
  
  if (!window.ipc.folder) {
    console.error('[IPC Check] window.ipc.folder is undefined!');
    return false;
  }
  
  return true;
}


