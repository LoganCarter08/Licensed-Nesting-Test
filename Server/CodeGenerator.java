import java.util.Random;

public class CodeGenerator {
	public static void main(String args[])
	{
		getPreCheck();
	}
	
	public static void getPreCheck()
	{
		String pre = "";
		Random rand = new Random();
		
		for (int i = 0; i < 8; i++)
		{
			pre = pre + rand.nextInt(10);
		}
		
		System.out.println(pre);
		
		luhn(pre);
	}
	
	
	public static void luhn(String preCheck)
	{
		int sum = 0;
		for (int i = 0; i < 8; i++)
		{
			int dig = Integer.parseInt(String.valueOf(preCheck.charAt(i)));
			if (i % 2 == 1) // check every other digit. starting after 0
			{
				dig = dig* 2;
				if (dig > 9)
				{
					dig = dig - 9; // 1 + dig % 10;
				}
			}
			sum = sum + dig; 
		}
		//System.out.println(sum);
		if (sum % 10 == 0)
			preCheck = preCheck + (0);
		else 
			preCheck = preCheck + (10 - sum % 10);
		addToDB(Integer.parseInt(preCheck));
	}
	
	public static void addToDB(int postCheck)
	{
		
	}
	
	public static int hasher(String company)
	{
		return 0;
	}
}