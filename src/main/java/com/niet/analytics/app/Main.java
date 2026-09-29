package com.niet.analytics.app;

import com.niet.analytics.repository.DatabaseManager;
import com.niet.analytics.repository.InMemoryStudentRepository;
import com.niet.analytics.repository.StudentRepository;
import com.niet.analytics.server.AnalyticsHttpServer;

import java.awt.Desktop;
import java.io.File;
import java.net.URI;

/**
 * Main application entry point for the Student Academic Performance Analytics System.
 * Developed for NIET Greater Noida, B.Tech CSE-R.
 * Course: CCSEH0355 (Object Oriented Techniques using Java)
 * Group: G-2
 */
public class Main {

    private static final int PORT = 8080;

    public static void main(String[] args) {
        printBanner();

        try {
            // 1. Initialize repositories and data directory
            File appDataDir = new File(System.getProperty("user.dir"), "data");
            File dbFile = new File(appDataDir, "academic_records.dat");

            StudentRepository repository = new InMemoryStudentRepository();
            DatabaseManager dbManager = new DatabaseManager(dbFile, repository);
            dbManager.initialize();

            System.out.println("[INFO] Repository initialized with " + repository.count() + " student records.");

            // 2. Locate web assets
            File webDir = new File(System.getProperty("user.dir"), "src/main/resources/web");
            if (!webDir.exists()) {
                webDir = new File("src/main/resources/web");
            }

            // 3. Start embedded HTTP server & API service
            AnalyticsHttpServer server = new AnalyticsHttpServer(PORT, repository, webDir);
            server.start();

            // 4. Try opening default browser
            String url = "http://localhost:" + PORT;
            System.out.println("[INFO] Opening browser dashboard at " + url + " ...");
            try {
                if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                    Desktop.getDesktop().browse(new URI(url));
                }
            } catch (Throwable ignored) {
                // In headless environments, browser launch is optional
            }

            System.out.println("[INFO] System is running. Press CTRL+C in this console to stop.");

            // Keep main thread alive
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n[INFO] Shutting down Academic Performance Analytics System...");
                try {
                    dbManager.saveToFile();
                    server.stop();
                } catch (Exception e) {
                    System.err.println("[WARN] Error during graceful shutdown: " + e.getMessage());
                }
                System.out.println("[INFO] Shutdown complete. Goodbye!");
            }));

        } catch (Exception e) {
            System.err.println("[ERROR] Failed to start analytics application: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void printBanner() {
        System.out.println("==========================================================================");
        System.out.println("   NIET GREATER NOIDA (An Autonomous Institute)                           ");
        System.out.println("   DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING (CSE-R)                   ");
        System.out.println("   PBL Project: Student Academic Performance Analytics System             ");
        System.out.println("   Course: Object Oriented Techniques using Java (CCSEH0355)             ");
        System.out.println("   Faculty Mentor: Disha Saini | Group: G-2                               ");
        System.out.println("   Team Members:                                                          ");
        System.out.println("     - Harsh Goyal                  (2501331690018)                       ");
        System.out.println("     - Aashi Goel                   (2501331690001)                       ");
        System.out.println("     - Nishant Kumar shankhdhar     (2501331690030)                       ");
        System.out.println("     - Ananya Garg                  (2501331690005)                       ");
        System.out.println("     - Saurabh                      (2501331690040)                       ");
        System.out.println("==========================================================================");
    }
}
