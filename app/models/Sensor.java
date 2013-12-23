package models;

import java.util.*;

import play.db.ebean.*;
import play.data.validation.Constraints.*;

import javax.persistence.*;

@Entity
public class Sensor extends Model{

  @Id
  public Long id;

  @Column(unique=true)
  @Required
  public String name;

  @OneToMany(mappedBy = "sensor", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
  @OrderBy("id")
  public Set<Position> positions = new HashSet<Position>();

  @ManyToOne
  public Landslip landslip;

  public static Finder<Long, Sensor> find = new Finder(
    Long.class, Sensor.class
  );

  public static List<Sensor> all(){
    return Sensor.all();
  }

  public static void create(Sensor sensor){
    sensor.save();
  }

  public static void delete(Long id){
    find.ref(id).delete();
  }

  public static Sensor findById(Long id){
    return find.byId(id);
  }

}
