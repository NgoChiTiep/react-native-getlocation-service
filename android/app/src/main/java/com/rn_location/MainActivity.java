package com.rn_location;

import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
//    setContentView(R.layout);
     initOPPO();
    autoLaunchOppo();
  }
   private void initOPPO() {
     try {
       Intent i = new Intent(Intent.ACTION_MAIN);
       i.setComponent(new ComponentName("com.oppo.safe", "com.oppo.safe.permission.floatwindow.FloatWindowListActivity"));
       startActivity(i);
     } catch (Exception e) {
       e.printStackTrace();
       try {

         Intent intent = new Intent("action.coloros.safecenter.FloatWindowListActivity");
         intent.setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.floatwindow.FloatWindowListActivity"));
         startActivity(intent);
       } catch (Exception ee) {

         ee.printStackTrace();
         try{

           Intent i = new Intent("com.coloros.safecenter");
           i.setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.sysfloatwindow.FloatWindowListActivity"));
           startActivity(i);
         }catch (Exception e1){

           e1.printStackTrace();
         }
       }

     }
   }
  private void autoLaunchOppo() {
    if (Build.MANUFACTURER.equalsIgnoreCase("oppo")) {
      try {
        Intent intent = new Intent();
        intent.setClassName("com.coloros.safecenter",
                "com.coloros.safecenter.permission.startup.StartupAppListActivity");
        startActivity(intent);
      } catch (Exception e) {
        try {
          Intent intent = new Intent();
          intent.setClassName("com.oppo.safe",
                  "com.oppo.safe.permission.startup.StartupAppListActivity");
          startActivity(intent);

        } catch (Exception ex) {
          try {
            Intent intent = new Intent();
            intent.setClassName("com.coloros.safecenter",
                    "com.coloros.safecenter.startupapp.StartupAppListActivity");
            startActivity(intent);
          } catch (Exception exx) {

          }
        }
      }
    }

  }
  @Override
  protected String getMainComponentName() {
    return "rn_location";
  }
}
