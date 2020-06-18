package com.rn_location;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;

import java.util.ArrayList;
import java.util.List;

/**
 * Get a dialog that informs the user to disable battery optimization for your app.
 * <p>
 * Use the dialog like that:
 * final AlertDialog dialog = BatteryOptimizationUtil.getBatteryOptimizationDialog(context);
 * if(dialog != null) dialog.show();
 * <p>
 * Alter the dialog texts so that they fit your needs. You can provide additional actions that
 * should be performed if the positive or negative button are clicked by using the provided method:
 * getBatteryOptimizationDialog(Context, OnBatteryOptimizationAccepted, OnBatteryOptimizationCanceled)
 * <p>
 * Source: https://gist.github.com/moopat/e9735fa8b5cff69d003353a4feadcdbc
 * <p>
 *
 * @author Markus Deutsch @moopat
 */
public class BatteryOptimizationUtil {

    /**
     * Get the battery optimization dialog.
     * By default the dialog will send the user to the relevant activity if the positive button is
     * clicked, and closes the dialog if the negative button is clicked.
     *
     * @param context Context
     * @return the dialog or null if battery optimization is not available on this device
     */
    @NonNull
    public static AlertDialog getBatteryOptimizationDialog(final Context context) {
        return getBatteryOptimizationDialog(context, null, null);
    }

    /**
     * Get the battery optimization dialog.
     * By default the dialog will send the user to the relevant activity if the positive button is
     * clicked, and closes the dialog if the negative button is clicked. Callbacks can be provided
     * to perform additional actions on either button click.
     *
     * @param context          Context
     * @param positiveCallback additional callback for the positive button. can be null.
     * @param negativeCallback additional callback for the negative button. can be null.
     * @return the dialog or null if battery optimization is not available on this device
     */
    @NonNull
    public static AlertDialog getBatteryOptimizationDialog(
            final Context context,
            @Nullable final OnBatteryOptimizationAccepted positiveCallback,
            @Nullable final OnBatteryOptimizationCanceled negativeCallback) {
        /*
         * If there is no resolvable component return right away. We do not use
         * isBatteryOptimizationAvailable() for this check in order to avoid checking for
         * resolvable components twice.
         */
        final ComponentName componentName = getResolveableComponentName(context);

        AlertDialog.Builder temp = new AlertDialog.Builder(context)
                .setTitle(R.string.dialog_battery_title)
                .setMessage(R.string.dialog_battery_message)
                .setNegativeButton(R.string.dialog_battery_button_negative, (dialog, which) -> {
                    if (negativeCallback != null)
                        negativeCallback.onBatteryOptimizationCanceled();
                });

        if (componentName != null) {
            temp.setPositiveButton(R.string.dialog_battery_button_positive, (dialog, which) -> {
                if (positiveCallback != null)
                    positiveCallback.onBatteryOptimizationAccepted();

                final Intent intent = new Intent();
                intent.setComponent(componentName);

                if (Build.MANUFACTURER.equals("OPPO")) {
                    try {
                        context.startActivity(new Intent().setComponent(new ComponentName("com.coloros.oppoguardelf", "com.coloros.powermanager.fuelgaue.PowerUsageModelActivity")));
                    } catch (Exception e) {
                        try {
                            context.startActivity(new Intent().setComponent(new ComponentName("com.coloros.oppoguardelf", "com.coloros.powermanager.fuelgaue.PowerSaverModeActivity")));
                        } catch (Exception e1) {
                            try {
                                context.startActivity(new Intent().setComponent(new ComponentName("com.coloros.oppoguardelf", "com.coloros.powermanager.fuelgaue.PowerConsumptionActivity")));
                            } catch (Exception e2) {

                            }
                        }
                    }
                } else {
                    context.startActivity(intent);
                }

            });
        }
        return temp.create();
    }

// --Commented out by Inspection START (4/19/19 1:16 AM):
//    /**
//     * Find out if battery optimization settings are available on this device.
//     *
//     * @param context Context
//     * @return true if battery optimization is available
//     */
//
//    //commented out by Fei during code cleanup undone
//    public static boolean isBatteryOptimizationAvailable(final Context context) {
//        return getResolveableComponentName(context) != null;
//    }
// --Commented out by Inspection STOP (4/19/19 1:16 AM)

    @Nullable
    private static ComponentName getResolveableComponentName(final Context context) {
        for (ComponentName componentName : getComponentNames()) {
            final Intent intent = new Intent();
            intent.setComponent(componentName);
            if (context.getPackageManager().resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY) != null)
                return componentName;
        }
        return null;
    }

    /**
     * Get a list of all known ComponentNames that provide battery optimization on different
     * devices.
     * Based on Shivam Oberoi's answer on StackOverflow: https://stackoverflow.com/a/48166241/2143225
     *
     * @return list of ComponentName
     */
    private static List<ComponentName> getComponentNames() {
        final List<ComponentName> names = new ArrayList<>();
        names.add(new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"));
        names.add(new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"));
        names.add(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"));
        names.add(new ComponentName("com.color.safecenter", "com.color.safecenter.permission.startup.StartupAppListActivity"));

        names.add(new ComponentName("com.coloros.oppoguardelf", "com.coloros.powermanager.fuelgaue.PowerUsageModelActivity"));
        names.add(new ComponentName("com.coloros.oppoguardelf", "com.coloros.powermanager.fuelgaue.PowerSaverModeActivity"));
        names.add(new ComponentName("com.coloros.oppoguardelf", "com.coloros.powermanager.fuelgaue.PowerConsumptionActivity"));
        names.add(new ComponentName("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"));
        names.add(new ComponentName("com.samsung.android.sm_cn", "com.samsung.android.sm.ui.battery.BatteryActivity"));
        names.add(new ComponentName("com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity"));
        names.add(new ComponentName("com.samsung.android.sm", "com.samsung.android.sm.ui.battery.BatteryActivity"));

        names.add(new ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"));
        names.add(new ComponentName("com.vivo.abe", "com.vivo.applicationbehaviorengine.ui.ExcessivePowerManagerActivity"));
        names.add(new ComponentName("com.htc.pitroad", "com.htc.pitroad.landingpage.activity.LandingPageActivity"));
        names.add(new ComponentName("com.asus.mobilemanager", "com.asus.mobilemanager.MainActivity"));
        names.add(new ComponentName("com.meizu.safe", "com.meizu.safe.powerui.PowerAppPermissionActivity"));
        names.add(new ComponentName("com.zte.heartyservice", "com.zte.heartyservice.setting.ClearAppSettingsActivity"));
        names.add(new ComponentName("com.lenovo.security", "com.lenovo.security.purebackground.PureBackgroundActivity"));
        names.add(new ComponentName("com.yulong.android.security", "com.yulong.android.seccenter.tabbarmain"));
        names.add(new ComponentName("com.letv.android.letvsafe", "com.letv.android.letvsafe.BackgroundAppManageActivity"));
        names.add(new ComponentName("com.gionee.softmanager", "com.gionee.softmanager.MainActivity"));
        return names;
    }

    public interface OnBatteryOptimizationAccepted {

        /**
         * Called if the user clicks the "OK" button of the battery optimization dialog. This does
         * not mean that the user has performed the necessary steps to exclude the app from
         * battery optimizations.
         */
        void onBatteryOptimizationAccepted();

    }

    public interface OnBatteryOptimizationCanceled {

        /**
         * Called if the user clicks the "Cancel" button of the battery optimization dialog.
         */
        void onBatteryOptimizationCanceled();

    }

}