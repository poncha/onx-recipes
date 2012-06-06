// sms settings
var lowBatterySmsContact = null; // if not null - phone number that will get SMS alert
var lowBatterySmsText = 'My battery is about to die.\nCurrent battery charge: %CHARGE%%';
var lowBatterySmsLocationText = 'My current location: lat=%LAT% lon=%LON%';

// http alert
var lowBatteryURL = 'http://example.com/onx/battery.low'; // if not null, this is the URL that will get http request

// set a flag so we do not flood the contact with sms messages
var lowBatterySmsSent = false;

device.battery.on('low', function(signal){
	lowBattery(signal);
});

device.battery.on('high', function(signal){
	// reset sms sending status once battery level is high again
	lowBatterySmsSent = false;
});

function lowBattery(signal)
{
	console.warning('Low Battery!');
	
	var location = signal.location !== undefined && signal.location !== null ? signal.location : device.location.lastLocation;
	var charge = signal.percentage !== undefined && signal.percentage !== null ? signal.percentage : device.battery.status.percentage;
	
	if(lowBatterySmsContact !== null && !lowBatterySmsSent)
	{
		var text = lowBatterySmsText.replace('%CHARGE%', charge);
		if(location !== undefined && location !== null && location.lat !== undefined && location.lon !== undefined)
		{
			text += '\n';
			text += lowBatterySmsLocationText
				.replace('%LAT%', location.latitude)
				.replace('%LON%', location.longitude);
		}

		console.info('Sending SMS message to ' + lowBatterySmsContact + ': ' + text);
			
		device.messaging.sendSms({
			to: lowBatterySmsContact,
			body: text
		});
		
		// set a flag so we do not flood the contact with sms messages
		lowBatterySmsSent = true;
	}
	
	if(lowBatteryURL !== null)
	{
		var url = lowBatteryURL;
		url += '?charge=' + charge;
		if(location !== undefined && location !== null && location.lat !== undefined && location.lon !== undefined)
		{
			url += '&lat=' + location.latitude;
			url += '&lon=' + location.longitude;
		}

		console.info('Calling URL: ' + url);

		device.ajax({
			url: url,
			type: 'GET'
		});
	}
}

