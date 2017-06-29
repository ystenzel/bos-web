package def.bos;
/** This class holds all the global functions and variables of the def.jquery package. */
public final class Globals {
    // private Globals(){}
    // public static JQueryStatic BoS;
    // @jsweet.lang.Module("bos")
    // public static JQueryStatic bos;
    /**
     * Accepts a string containing a CSS selector which is then used to match a set of elements.
     *
     * @param selector A string containing a selector expression
     * @param context A DOM Element, Document, or jQuery to use as context
     */
    native public static def.bos.BoS loeschen();

    native public static def.bos.BoS farbe(java.lang.Integer i, java.lang.Integer color);
    native public static def.bos.BoS farbe2(java.lang.Integer x, java.lang.Integer y, java.lang.Integer color);
    native public static def.bos.BoS farben(java.lang.Integer color);

    native public static def.bos.BoS flaeche(java.lang.Integer color);

    native public static def.bos.BoS form(java.lang.Integer i, java.lang.String shape);
    native public static def.bos.BoS form2(java.lang.Integer x, java.lang.Integer y, java.lang.String shape);
    native public static def.bos.BoS formen(java.lang.String shape);

    native public static def.bos.BoS groesse(java.lang.Integer x, java.lang.Integer y);

    native public static def.bos.BoS hintergrund(java.lang.Integer i, java.lang.Integer color);
    native public static def.bos.BoS hintergrund2(java.lang.Integer x, java.lang.Integer y, java.lang.Integer color);

    native public static def.bos.BoS rahmen(java.lang.Integer color);

    native public static def.bos.BoS symbolGroesse(java.lang.Integer i, java.lang.Double percent);
    native public static def.bos.BoS symbolGroesse2(java.lang.Integer x, java.lang.Integer y, java.lang.Double percent);

    native public static def.bos.BoS text(java.lang.Integer i, java.lang.String text);
    native public static def.bos.BoS text2(java.lang.Integer x, java.lang.Integer y, java.lang.String text);

    native public static def.bos.BoS textFarbe(java.lang.Integer i, java.lang.Integer color);
    native public static def.bos.BoS textFarbe2(java.lang.Integer x, java.lang.Integer y, java.lang.Integer color);
   
}

