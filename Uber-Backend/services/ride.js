//rides

var rideSchema = require('./model/rideSchema');
var customerSchema = require('./model/customerSchema');
var driverSchema = require('./model/driverSchema');
var requestGen = require('./commons/responseGenerator');

var Customers = customerSchema.Customers; //mongoDB instance
var Drivers = driverSchema.Drivers; //mongoDB instance

var Rides = rideSchema.Rides;

exports.createRide = function(msg, callback){

	var pickUpLocation = msg.pickUpLocation;
	var dropOffLocation = msg.dropOffLocation;
	var rideDateTime = new Date();
	var customerId = msg.customerId;
	var driverId = msg.driverId;

	var newRide = new Rides({
		pickUpLocation: pickUpLocation,
		dropOffLocation: dropOffLocation,
		rideDateTime: rideDateTime,
		customerId: customerId,
		driverId: driverId
	});

	var json_responses;

	var rideId;

	newRide.save(function(err) {

		if (err) {
			json_responses = requestGen.responseGenerator(500, {message: " error creating Ride" });
			callback(null, json_responses);
		}
		else {

			Rides.findOne({rideDateTime: rideDateTime, $and: [{customerId: customerId}, {driverId: driverId}]}, function(err, doc){
				if(err){
					json_responses = requestGen.responseGenerator(500, {message: " error finding rideId" });
					callback(null, json_responses);
				}
				else{
					rideId = doc.rideId;

					Customers.findOne({custId: customerId}, function(err, doc){
						if(err){
							json_responses = requestGen.responseGenerator(500, {message: " error adding ride to customer"  });
							callback(null, json_responses);
						}
						else{
							doc.rides.push({
								rideId: rideId
							});
							doc.save();

							Drivers.findOne({driId: driverId}, function(err, doc){
								if(err){
									json_responses = requestGen.responseGenerator(500, {message: " error adding ride to driver"  });
									callback(null, json_responses);
								}
								else{
									doc.rides.push({
										rideId: rideId
									});
									doc.save();

									json_responses = requestGen.responseGenerator(200, {message: "ride created successfully" });
									callback(null, json_responses);
								}
							});
						}
					});
				}
			});
		}
	});
};