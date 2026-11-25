export const UNITS = [
 ['m','length',1,['metre','meter','metres','meters']], ['km','length',1000,['kilometre','kilometer','kilometres','kilometers']], ['cm','length',.01,[]],['mm','length',.001,[]],['in','length',.0254,['inch','inches']],['ft','length',.3048,['foot','feet']],['yd','length',.9144,['yard','yards']],['mi','length',1609.344,['mile','miles']],['nautical mile','length',1852,['nautical miles','nmi']],['smoot','length',1.7018,['smoots']],['hand','length',.1016,['hands']],
 ['m²','area',1,['m2','square metre','square metres','square meter','square meters']],['km²','area',1e6,['km2']],['ft²','area',.09290304,['ft2','square feet']],['acre','area',4046.8564224,['acres']],['ha','area',10000,['hectare','hectares']],
 ['kg','mass',1,['kilogram','kilograms']],['g','mass',.001,['gram','grams']],['mg','mass',.000001,[]],['lb','mass',.45359237,['pound','pounds','lbs']],['oz','mass',.028349523125,['ounce','ounces']],['tonne','mass',1000,['tonnes','metric ton','metric tons']],['US ton','mass',907.18474,['short ton','short tons']],
 ['L','volume',1,['litre','litres','liter','liters']],['mL','volume',.001,['millilitre','millilitres','milliliter','milliliters']],['m³','volume',1000,['m3']],['US gallon','volume',3.785411784,['US gallons','US gal']],['imperial gallon','volume',4.54609,['imperial gallons','imp gal']],['US cup','volume',.2365882365,['US cups']],['metric cup','volume',.25,['metric cups']],['US fl oz','volume',.0295735295625,[]],
 ['s','time',1,['second','seconds','sec']],['min','time',60,['minute','minutes']],['h','time',3600,['hour','hours','hr']],['day','time',86400,['days']],['week','time',604800,['weeks']],
 ['mW','power',.001,['milliwatt','milliwatts']],['W','power',1,['watt','watts']],['kW','power',1000,['kilowatt','kilowatts']],['MW','power',1e6,[]],['J','energy',1,['joule','joules']],['kJ','energy',1000,[]],['Wh','energy',3600,[]],['kWh','energy',3600000,[]],['kcal','energy',4184,['food calorie','food calories']],
 ['m/s','speed',1,[]],['km/h','speed',1/3.6,['kph']],['mph','speed',.44704,[]],['knot','speed',.5144444444444445,['knots','kt']],
];
const numberPattern='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
const quantityRegex=new RegExp(`^(${numberPattern})\\s*(.+)$`,'i');
export function finite(value){if(!Number.isFinite(value)||Math.abs(value)>1e30)throw new Error('Use finite values with a magnitude no greater than 10³⁰.');return value;}
export function format(value){finite(value);return new Intl.NumberFormat('en-CA',{maximumSignificantDigits:10}).format(value);}
export function parseQuantity(text){const m=String(text).trim().match(quantityRegex);if(!m)throw new Error('Use a number followed by its unit, for example 100 GB.');return {value:finite(Number(m[1])),unit:m[2].trim()};}
export function storageUnit(unit){
 const full={byte:'B',bytes:'B',bit:'b',bits:'b'};unit=full[unit.toLowerCase()]||unit;
 const m=unit.match(/^([kKMGTPE]?)(i?)([bB])$/);if(!m)return null;
 const p='KMGTPE'.indexOf(m[1].toUpperCase())+1; if(m[2]&&!p)return null;
 return {name:unit,dimension:'storage',factor:Math.pow(m[2]?1024:1000,p)/(m[3]==='b'?8:1)};
}
function unitInfo(unit){
 const data=storageUnit(unit);if(data)return data;
 const rate=unit.match(/^(.+?)(?:\/s|ps)$/);if(rate){const v=storageUnit(rate[1]);if(v)return {...v,name:unit,dimension:'data-rate'};}
 if(['C','°C','celsius'].includes(unit))return {name:'°C',dimension:'temperature',factor:1,offset:273.15};
 if(['F','°F','fahrenheit'].includes(unit))return {name:'°F',dimension:'temperature',factor:5/9,offset:255.3722222222222};
 if(['K','kelvin'].includes(unit))return {name:'K',dimension:'temperature',factor:1,offset:0};
 const key=unit.toLowerCase();const exact=UNITS.find(r=>r[0]===unit);const aliases=UNITS.find(r=>r[3].some(a=>a.toLowerCase()===key));const matches=UNITS.filter(r=>r[0].toLowerCase()===key);const row=exact||aliases||(matches.length===1?matches[0]:null);
 if(!row)throw new Error(`Unknown or ambiguous unit “${unit}”. Use explicit US/imperial gallons, metric/US cups, and B for bytes or b for bits.`);
 return {name:row[0],dimension:row[1],factor:row[2]};
}
export function convert(value,from,to){
 const a=unitInfo(from),b=unitInfo(to);if(a.dimension!==b.dimension)throw new Error(`Cannot convert ${a.dimension} to ${b.dimension}.`);
 const base=finite(value*a.factor+(a.offset||0));if(a.dimension==='temperature'&&base<-1e-9)throw new Error('Temperature cannot be below absolute zero.');
 const result=finite((base-(b.offset||0))/b.factor);
 return {kind:'conversion',value:result,unit:b.name,headline:`${format(result)} ${b.name}`,detail:`${format(value)} ${a.name} = ${format(result)} ${b.name}`,formula:a.dimension==='temperature'?'Convert through Kelvin, including temperature offsets.':`${format(value)} × ${format(a.factor)} ÷ ${format(b.factor)}`,notes:a.dimension==='storage'||a.dimension==='data-rate'?['B means bytes; b means bits. One byte is eight bits. SI prefixes use 1,000; IEC prefixes (Ki, Mi, Gi) use 1,024.']:['US customary units and international feet/miles use their exact definitions. Displayed decimals are rounded.']};
}
export function duration(seconds){if(seconds===0)return '0 seconds';if(seconds<.001)return `${format(seconds*1e6)} µs`;if(seconds<1)return `${format(seconds*1000)} ms`;let left=seconds;const parts=[];for(const [size,label]of [[86400,'day'],[3600,'hour'],[60,'minute']]){const n=Math.floor(left/size);if(n){parts.push(`${format(n)} ${label}${n===1?'':'s'}`);left-=n*size;}}if(left>=.001||!parts.length)parts.push(`${format(left)} second${left===1?'':'s'}`);return parts.join(', ');}
export function transfer(size,rate,efficiency=100){const q=typeof size==='string'?parseQuantity(size):size,r=typeof rate==='string'?parseQuantity(rate):rate;const a=unitInfo(q.unit),b=unitInfo(r.unit);if(a.dimension!=='storage'||b.dimension!=='data-rate')throw new Error('Transfer time needs a data amount and a rate, such as 100 GB at 100 Mbps.');if(q.value<0||r.value<=0||!Number.isFinite(efficiency)||efficiency<=0||efficiency>100)throw new Error('Size must be nonnegative, rate positive, and efficiency between 0 and 100%.');const bytes=finite(q.value*a.factor),bytesPerSecond=finite(r.value*b.factor),seconds=finite(bytes/(bytesPerSecond*efficiency/100));return {kind:'transfer',value:seconds,unit:'seconds',headline:duration(seconds),detail:`${format(q.value)} ${q.unit} at ${format(r.value)} ${r.unit} · ${format(efficiency)}% useful throughput`,formula:`${format(bytes)} bytes ÷ (${format(bytesPerSecond)} bytes/s × ${format(efficiency/100)})`,notes:['An estimate at a constant rate. Congestion, Wi-Fi, storage speed, protocol overhead and provider limits can make the transfer slower.','Efficiency is your assumption, not a measured network speed.']};}
export function energy(power,time,rate=null,currency='CAD'){const p=typeof power==='string'?parseQuantity(power):power,t=typeof time==='string'?parseQuantity(time):time;const a=unitInfo(p.unit),b=unitInfo(t.unit);if(a.dimension!=='power'||b.dimension!=='time')throw new Error('Energy needs power and a duration, such as 500 W for 8 hours.');if(p.value<0||t.value<0||rate!==null&&(!Number.isFinite(rate)||rate<0))throw new Error('Power, duration and price must be nonnegative.');const kwh=finite(p.value*a.factor*t.value*b.factor/3600000),cost=rate===null?null:finite(kwh*rate);return {kind:'energy',value:kwh,unit:'kWh',headline:`${format(kwh)} kWh`,detail:cost===null?'Energy at constant power':`${format(cost)} ${currency} at ${format(rate)} ${currency}/kWh`,formula:`${format(p.value*a.factor/1000)} kW × ${format(t.value*b.factor/3600)} hours`,notes:['Uses continuous power for the entered duration. Appliances often cycle or vary their draw.',cost===null?'Add a rate to estimate the energy charge.':'Only the energy charge is included; taxes, fixed fees and tiered/time-of-use rates are excluded.']};}
export function calculate(query,options={}){
 let q=String(query).trim().replace(/,/g,'');if(!q||q.length>300)throw new Error('Enter a calculation of up to 300 characters.');q=q.replace(/^(?:how long (?:does it take )?to |how long to )/i,'').replace(/^(?:convert\s+)/i,'');
 let m=q.match(/^(?:(?:transfer|download|upload)\s+)?(.+?)\s+(?:at|@)\s+(.+?)$/i);
 if(m){try{const a=parseQuantity(m[1]),b=parseQuantity(m[2]);if(storageUnit(a.unit))return transfer(a,b,options.efficiency??100);}catch(e){if(/^(?:transfer|download|upload)\b/i.test(q))throw e;}}
 m=q.match(new RegExp(`^(.+?)\\s+for\\s+(.+?)(?:\\s+at\\s+(${numberPattern})\\s*(CAD|USD|EUR|GBP)?\\s*\\/\\s*kWh)?$`,'i'));
 if(m)return energy(m[1],m[2],m[3]===undefined?null:Number(m[3]),(m[4]||'CAD').toUpperCase());
 m=q.match(/^(.+?)\s+(?:to|in)\s+(.+)$/i);if(m){const a=parseQuantity(m[1]);return convert(a.value,a.unit,m[2].trim());}
 throw new Error('Try “100 GB at 100 Mbps”, “500 W for 8 hours at 0.15 CAD/kWh”, or “12 miles to km”. This local parser accepts these formats; it does not execute expressions.');
}
