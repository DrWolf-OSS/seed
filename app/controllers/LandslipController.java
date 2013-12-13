package controllers;

import play.*;
import play.mvc.*;
import play.data.Form;
import views.html.*;
import models.*;


public class LandslipController extends Controller {


  static Form<Landslip> landslipForm = Form.form(Landslip.class);


  public static Result landslips() {
    return ok(views.html.Landslips.render(Landslip.all(), landslipForm));
  }

  public static Result newLandslip(){
    return TODO;
  }

  public static Result deleteLandslip(Long id){
    return TODO;
  }
}
