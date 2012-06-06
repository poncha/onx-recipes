// we need to keep track of these in order to workaround the misfiring isCharging bug
var lastStatus = null; // last status object

var batteryLow = 10;
var batteryHigh = 80;

device.battery.on("updated", function(signal){
	
	//logBatteryEvent('updated_orig', signal);
	
	var wasCharging = false;
	var isCharging = false;
	if(lastStatus !== null)
	{
		wasCharging = lastStatus.isCharging;
		isCharging = signal.percentage > lastStatus.percentage || signal.percentage == lastStatus.percentage && wasCharging;
	}
	var isLow = signal.percentage <= batteryLow;
	var isHigh = signal.percentage >= batteryHigh;
	
	// copy the event - most of the properties in signal are read-only
	// override isCharging, isLow and isHigh we just calculated
	var status = {
		isCharging: isCharging,
		percentage: signal.percentage,
		isLow: isLow,
		isHigh: isHigh,
		signalType: signal.signalType,
		tag: signal.tag,
		data: {
			percentage: signal.percentage,
			charging: isCharging
		},
		location: signal.location,
		shouldStore: signal.shouldStore,
		utcTimestamp: signal.utcTimestamp
	};

	//logBatteryEvent('updated', status);
	
	// is battery level changed?
	if(lastStatus !== null && status.percentage != lastStatus.percentage)
	{
		if(isCharging)
		{
			if(!wasCharging) device.battery.emit('startedCharging', status.data);
			if(isHigh) device.battery.emit('high', status.data);
		}
		else
		{
			if(wasCharging) device.battery.emit('stoppedCharging', status.data);
			if(isLow) device.battery.emit('low', status.data);
		}
	}

	// remember last status
	lastStatus = status;
});

device.battery.on("startedCharging", function(signal){
	console.info("Started charging");
	//logBatteryEvent('startedCharging',signal);
	
	// launch Desk Clock if started charging ;)
	device.applications.launchPackage('com.android.clock', {mode: 'Desk Clock'});
});

device.battery.on("stoppedCharging", function(signal){
	console.info("Stopped charging");
	//logBatteryEvent('stoppedCharging',signal);
});

device.battery.on("high", function(signal){
	//logBatteryEvent('high',signal);
});

device.battery.on("low", function(signal){
	console.warning("Low Battery!");
	//logBatteryEvent('low',signal);
});

function logBatteryEvent(event_type, signal)
{
	if(typeof(signal) != 'object')
	{
		console.error('Signal is not an object');
		return;
	}
	
	var log = 'battery.' + event_type + ': {';
	if(signal.isCharging !== undefined) log += 'isCharging:' + (signal.isCharging !== null ? signal.isCharging : 'null') + ', ';
	if(signal.percentage !== undefined) log += 'percentage:' + (signal.percentage !== null ? signal.percentage : 'null') + ', ';
	if(signal.isLow !== undefined) log += 'isLow:' + (signal.isLow !== null ? signal.isLow : 'null') + ', ';
	if(signal.isHigh !== undefined) log += 'isHigh:' + (signal.isHigh !== null ? signal.isHigh : 'null') + ', ';
	if(signal.signalType !== undefined) log += 'signalType:' + (signal.signalType !== null ? signal.signalType : 'null') + ', ';
	if(signal.tag !== undefined) log += 'tag:' + (signal.tag !== null ? signal.tag : 'null') + ', ';
	if(signal.data !== undefined && signal.data !== null)
	{
		log += 'data: {';
		for(var key in signal.data) log += key + ':' + signal.data[key] + ', ';
		log = log.replace(/, $/, '');
		log += '}, ';
	}
	if(signal.location !== undefined) log += 'location:' + (signal.location !== null ? signal.location : 'null') + ', ';
	if(signal.shouldStore !== undefined) log += 'shouldStore:' + (signal.shouldStore !== null ? signal.shouldStore : 'null') + ', ';
	if(signal.utcTimestamp !== undefined) log += 'utcTimestamp:' + (signal.utcTimestamp !== null ? signal.utcTimestamp : 'null') + ', ';
	log = log.replace(/, $/, '');
	log += '}';
	
	console.log(log);
}

