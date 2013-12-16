package models;

import java.util.*;

import play.db.ebean.*;
import play.data.validation.Constraints.*;

import javax.persistence.*;

@Entity
public class Position extends Model{

  @Id
  public Long id;

  @Column
  public Long x;


  @Column
  public Long y;


  @Column
  public Long z;


  @Column
  public Long t;

  @ManyToOne
  public Sensor sensor;

  public static Finder<Long, Position> find = new Finder(
      Long.class, Position.class
  );

  public static List<Position> all(){
    return Position.all();
  }

  public static void create(Position position){
    position.save();
  }

  public static void delete(Long id){
    find.ref(id).delete();
  }
}
