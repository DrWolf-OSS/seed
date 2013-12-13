package models;

import java.util.*;

import play.db.ebean.*;
import play.data.validation.Constraints.*;

import javax.persistence.*;

@Entity
public class Landslip extends Model{

  @Id
  public Long id;

  @Column(unique=true)
  @Required
  public String name;

  @Column(columnDefinition = "TEXT")
  private String description;


  public static Finder<Long,Landslip> find = new Finder(
      Long.class, Landslip.class
  );

  public static List<Landslip> all(){
    return find.all();
  }

  public static void create(Landslip landslip){
   landslip.save();
  }

  public static void delete(Long id){
    find.ref(id).delete();
  }

}
