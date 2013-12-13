package models;

import java.util.*;

public class Landslip {

  public Long id;
  public String name;

  /*@Column(columnDefinition = "TEXT")*/
  private String description;

  public static List<Landslip> all(){
    return new ArrayList<Landslip>();
  }

  public static void create(Landslip landslip){

  }

  public static void delete(Long id){

  }

}
