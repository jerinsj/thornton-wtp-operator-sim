function patchSimulatorSourceV16Finalize(source){
  return source.replace('<\\/script></body>','</'+'script></body>');
}
