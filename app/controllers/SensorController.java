package controllers;

import play.*;
import play.mvc.*;
import play.data.Form;
import views.html.*;
import models.*;

public class SensorController extends Controller {

  static Form<Sensor> sensorForm = Form.form(Sensor.class);


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
      sensor.setLandslip(landslip);
      Sensor.create(filledForm.get());
      return redirect(routes.LandslipController.view(landslipId));
    }

  }

  public static Result delete(Long id, Long landslipId){
    Sensor.delete(id);
    return redirect(routes.LandslipController.view(landslipId));
  }


}
