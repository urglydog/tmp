import os
from payos import PayOS
from dotenv import load_dotenv

load_dotenv()
payos_client = PayOS(
    client_id=os.environ.get('PAYOS_CLIENT_ID'),
    api_key=os.environ.get('PAYOS_API_KEY'),
    checksum_key=os.environ.get('PAYOS_CHECKSUM_KEY')
)

orders = [433708709, 761489476, 905998685, 975819772, 658576845, 721655118]
for order in orders:
    try:
        info = payos_client.getPaymentLinkInformation(order)
        print(f"Order {order}: {info.status}")
    except Exception as e:
        print(f"Order {order}: ERROR {e}")
