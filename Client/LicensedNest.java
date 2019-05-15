public class LicensedNest 
{
	public static void main(String args[])
	{
		try 
		{
			License lic = new License();
			lic.verify();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}
}