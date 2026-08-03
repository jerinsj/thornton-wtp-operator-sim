function patchSimulatorSourceV16CTCompat(source){
  const marker='const pageMeta={';
  if(!source.includes(marker))throw new Error('V16.10.1 CT compatibility patch could not locate page metadata object.');
  const compat="\n    chemicals:['SCADA / CHEMICALS','Ozone / Chemicals','Dose setpoints, caustic pH/alkalinity trim, equivalent lb/MG, calculated lb/day demand, feed delivery and process response.'],";
  if(!source.includes(compat.trim())) source=source.replace(marker,marker+compat);
  return source;
}
