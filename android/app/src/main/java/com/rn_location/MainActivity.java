package com.rn_location;

import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  // @Override
  // protected void onCreate(Bundle savedInstanceState) {
  //   super.onCreate(savedInstanceState);
  //    initOPPO();
  // }
  //  private void initOPPO() {
  //    try {
  //      Intent i = new Intent(Intent.ACTION_MAIN);
  //      i.setComponent(new ComponentName("com.oppo.safe", "com.oppo.safe.permission.floatwindow.FloatWindowListActivity"));
  //      startActivity(i);
  //    } catch (Exception e) {
  //      e.printStackTrace();
  //      try {
  //        Intent intent = new Intent("action.coloros.safecenter.FloatWindowListActivity");
  //        intent.setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.floatwindow.FloatWindowListActivity"));
  //        startActivity(intent);
  //      } catch (Exception ee) {

  //        ee.printStackTrace();
  //        try{

  //          Intent i = new Intent("com.coloros.safecenter");
  //          i.setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.sysfloatwindow.FloatWindowListActivity"));
  //          startActivity(i);
  //        }catch (Exception e1){

  //          e1.printStackTrace();
  //        }
  //      }

  //    }
  //  }
  @Override
  protected String getMainComponentName() {
    return "rn_location";
  }
}
