function patchSimulatorSourceV16Finalize(source){
  return source.split('<\\/script>').join('</'+'script>');
}
