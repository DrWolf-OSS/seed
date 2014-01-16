package controllers;

import play.*;
import play.mvc.*;
import play.data.Form;
import views.html.*;
import models.*;

public class LandslipController extends Controller {

  static Form<Landslip> landslipForm = Form.form(Landslip.class);
  static Form<Sensor> sensorForm = Form.form(Sensor.class);

  public static Result landslips() {
    return ok(views.html.Landslips.render(Landslip.all(), landslipForm));
  }

  public static Result newLandslip(){
    Form<Landslip> filledForm = landslipForm.bindFromRequest();
    if(filledForm.hasErrors()){
      return badRequest(views.html.Landslips.render(Landslip.all(), filledForm));
    } else {
    Logger.info("No error validating the form");
      Landslip.create(filledForm.get());
      return redirect(routes.LandslipController.landslips());
    }

  }

  public static Result deleteLandslip(Long id){
    Landslip.delete(id);
    return redirect(routes.LandslipController.landslips());
  }

  public static Result view(Long id){
    return ok(landslip.render(Landslip.findById(id), sensorForm));
  }
  

  public static Result showGraph(Long id){
    return ok(graph.render(Landslip.findById(id), sensorForm));
  }

}
