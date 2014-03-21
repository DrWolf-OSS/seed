package controllers;

import play.*;
import play.mvc.*;
import play.data.Form;
import views.html.*;
import models.*;
import play.libs.Json;

public class SensorController extends Controller {

  static Form<Sensor> sensorForm = Form.form(Sensor.class);
  static Form<Position> positionForm = Form.form(Position.class);


  public static Result sensors(Long landslipId) {
    return ok(views.html.landslip.render(Landslip.findById(landslipId), sensorForm));
  }

  public static Result newSensor(Long landslipId){
    Form<Sensor> filledForm = sensorForm.bindFromRequest();
    Landslip landslip = Landslip.findById(landslipId);
    if(filledForm.hasErrors()){
      return TODO;
    } else {
      Sensor sensor = filledForm.get();
      sensor.landslip = landslip;
      Sensor.create(filledForm.get());
      return redirect(routes.LandslipController.view(landslipId));
    }

  }

  public static Result delete(Long id, Long landslipId){
    Sensor.delete(id);
    return redirect(routes.LandslipController.view(landslipId));
  }

  public static Result view(Long id){
    return ok(sensor.render(Sensor.findById(id), positionForm));
  }
  
  public static Result javascriptRoutes() {
    Controller.response().setContentType("text/javascript");
    return Results.ok(Routes.javascriptRouter("sensorjs",
          controllers.routes.javascript.SensorController.getSensorInformation()
          ));
  }


  public static Result getSensorInformation(Long id) throws Exception {

    Sensor sensor = Sensor.findById(id);

    return Results.ok(Json.toJson(sensor.name));
  }
}
