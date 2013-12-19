package controllers;

import play.*;
import play.mvc.*;
import play.data.Form;
import views.html.*;
import models.*;

public class SensorController extends Controller {

  static Form<Sensor> sensorForm = Form.form(Sensor.class);


  public static Result sensors(Long landslipId) {
    return ok(views.html.landslip.render(Landslip.findById(landslipId)));
  }

  public static Result newSensor(Long landslipId){
    Form<Sensor> filledForm = sensorForm.bindFromRequest();
    if(filledForm.hasErrors()){
      return TODO;
    } else {
      Sensor.create(filledForm.get());
      return ok(views.html.landslip.render(Landslip.findById(landslipId)));
    }

  }

  public static Result delete(Long id, Long landslipId){
    Sensor.delete(id);
    return ok(views.html.landslip.render(Landslip.findById(landslipId)));
  }


}
