package com.ppil.groupede.callmeishmael.fragment;


import android.content.Context;
import android.os.Bundle;
import android.os.Environment;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.ppil.groupede.callmeishmael.FileChooser.FileChooser;
import com.ppil.groupede.callmeishmael.MainActivity;
import com.ppil.groupede.callmeishmael.R;
import com.ppil.groupede.callmeishmael.SingletonBackPressed;
import com.ppil.groupede.callmeishmael.data.Data;
import com.ppil.groupede.callmeishmael.data.DataManager;
import com.ppil.groupede.callmeishmael.data.DataReceiver;
import com.ppil.groupede.callmeishmael.data.SessionManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * A simple {@link Fragment} subclass.
 */
public class ImporterFragment extends Fragment implements DataReceiver{


    /*
        Classe permettant à un utilisateur d'importer un epub
        à partir d'un epub téléchargé sur son mobile
     */
    private TextView epub;
    private TextView image;
    private EditText titre;
    private EditText auteur;
    private EditText resume;
    private Spinner genre;
    private Spinner langue;
    private Button valider;
    private TextView afficherEpub;
    private TextView afficherImage;

    private String epub_url;
    private String image_url;

    public ImporterFragment() {
        // Required empty public constructor
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_importer, container, false);
        epub_url = "";
        image_url = "";
        epub = (TextView) view.findViewById(R.id.lien_epub);
        image = (TextView) view.findViewById(R.id.lien_image);
        afficherEpub = (TextView) view.findViewById(R.id.afficher_epub);
        afficherImage = (TextView) view.findViewById(R.id.afficher_image);
        titre = (EditText) view.findViewById(R.id.titre);
        auteur = (EditText) view.findViewById(R.id.auteur);
        resume = (EditText) view.findViewById(R.id.resume);
        genre = (Spinner) view.findViewById(R.id.genre);
        langue = (Spinner) view.findViewById(R.id.langue);
        valider = (Button) view.findViewById(R.id.importer_bouton);

        //On affecte les Listeners ici...
        epub.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FileChooser fileChooser = new FileChooser(getActivity());
                fileChooser.setFileListener(new FileChooser.FileSelectedListener() {
                    @Override
                    public void fileSelected(final File file) {
                        epub_url = file.getAbsolutePath();
                        afficherEpub.setText(epub_url);
                    }
                });
                                               /*
                                                    On ne cherche que des fichiers de type image, donc jpg ici
                                                */
                fileChooser.setExtension(".epub");
                                               /*
                                                    On ouvre la fenetre de dialogue
                                                */
                fileChooser.showDialog();
            }
        });

        image.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FileChooser fileChooser = new FileChooser(getActivity());
                fileChooser.setFileListener(new FileChooser.FileSelectedListener() {
                    @Override
                    public void fileSelected(final File file) {
                        image_url = file.getAbsolutePath();
                        afficherImage.setText(image_url);
                    }
                });
                                               /*
                                                    On ne cherche que des fichiers de type image, donc jpg ici
                                                */
                fileChooser.setExtension(".jpg");
                                               /*
                                                    On ouvre la fenetre de dialogue
                                                */
                fileChooser.showDialog();
            }
        });

        /*
            Bouton de validation
         */
        valider.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String title, author, resum, gender, langage;
                //Si le lien epub est vide alors -> erreur
                if(epub_url.equals("")){
                    Toast.makeText(getContext()," Vous devez choisir un epub !", Toast.LENGTH_SHORT).show();
                }
                else{
                    title = titre.getText().toString();
                    author = auteur.getText().toString();
                    resum = resume.getText().toString();
                    gender = genre.getSelectedItem().toString();
                    langage = langue.getSelectedItem().toString();
                    if(title.replaceAll("\\s","").equals("")){
                        Toast.makeText(getContext()," Vous devez choisir un titre !", Toast.LENGTH_SHORT).show();
                    }else{
                        //masquer le clavier
                        View view2 = getActivity().getCurrentFocus();
                        if (view2 != null) {
                            InputMethodManager imm = (InputMethodManager)getActivity().getSystemService(Context.INPUT_METHOD_SERVICE);
                            imm.hideSoftInputFromWindow(view2.getWindowToken(), 0);
                        }

                        /*
                            ON va maintenant demander à Data, DataManager, et Session
                            d'ajouter ce livre à la liste de lecture de l'utilisateur
                            actuellement connecté
                         */
                        SessionManager sessionManager = new SessionManager(getContext());
                        String email = sessionManager.getSessionEmail();

                        //URL pour demander un import d'un epub
                        String adresse = Data.getData().getURLImporterLivre();
                        byte[] infos = Data.getData().getPostImporterLivre(email, epub_url, image_url, title, author, resum, gender, langage);
                        DataManager dataManager = new DataManager(ImporterFragment.this);
                        dataManager.execute(adresse,infos);
                    }
                }
            }
        });

        //change d'état le bouton de retour
        SingletonBackPressed.getInstance().setCanBackView(false);

        return view;
    }

    /*
        Fonction appelée lorsque le serveur aura réussi a inserer dans la base l'epub de l'utilisateur
     */
    @Override
    public void receiveData(String resultat) {
        if(resultat.equals("false")){
            Toast.makeText(getContext()," Ce livre est déjà dans votre liste de lecture !", Toast.LENGTH_SHORT).show();
        }else{
            String idLivre = resultat;
            System.out.println("URL EPub "+epub_url);
            System.out.println("Path " + Data.getData().getPath());
            System.out.println("nom livre : "+(idLivre + ".epub"));
            copyFile(epub_url, Data.getData().getPath() ,idLivre + ".epub");
            deleteFile(epub_url);
            AccueilFragment fragment = new AccueilFragment();
            getActivity().setTitle("Accueil");
            FragmentManager fragmentManager = getActivity().getSupportFragmentManager();
            FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
            fragmentTransaction.replace(R.id.fragment_container, fragment);
            fragmentTransaction.addToBackStack(null);
            fragmentTransaction.commit();
            ((MainActivity)getActivity()).setConnection(true); // l'utilisateur est connecté
        }

    }

/*
    Permet de copier le contenu d'un livre contenu e dans inputPath avec comme nom
    inputFile vers outputPath avec idLivre.epub comme nom
 */
    private void copyFile(String inputFile, String outputPath, String name) {

        InputStream in = null;
        OutputStream out = null;
        try {

            //create output directory if it doesn't exist
            File dir = new File (outputPath);
            if (!dir.exists())
            {
                dir.mkdirs();
            }


            in = new FileInputStream(inputFile);
            out = new FileOutputStream(outputPath + "/" + name);

            byte[] buffer = new byte[1024];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            in.close();
            in = null;

            // write the output file (You have now copied the file)
            out.flush();
            out.close();
            out = null;

        }  catch (FileNotFoundException fnfe1) {
            Log.e("tag", fnfe1.getMessage());
        }
        catch (Exception e) {
            Log.e("tag", e.getMessage());
        }

    }

    /*
        Permet de supprimer un fihcier
     */
    private void deleteFile(String inputFile) {
        try {
            // delete the original file
            new File(inputFile).delete();
        } catch (Exception e) {
            Log.e("tag", e.getMessage());
        }
    }
}
