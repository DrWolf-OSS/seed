package controllers;

import play.*;
import play.mvc.*;
import play.data.Form;
import views.html.*;
import models.*;

public class PositionController extends Controller {

  static Form<Position> positionForm = Form.form(Position.class);


  public static Result positions(Long sensorId) {
    return ok(views.html.sensor.render(Sensor.findById(sensorId), positionForm));
  }

  public static Result newPosition(Long sensorId){
    Form<Position> filledForm = positionForm.bindFromRequest();
    Sensor sensor = Sensor.findById(sensorId);
    if(filledForm.hasErrors()){
      return TODO;
    } else {
      Position position = filledForm.get();
      position.sensor = sensor;
      Position.create(position);
      return redirect(routes.SensorController.view(sensorId));
    }

  }

  public static Result delete(Long id, Long sensorId){
    Position.delete(id);
    return redirect(routes.SensorController.view(sensorId));
  }


}
