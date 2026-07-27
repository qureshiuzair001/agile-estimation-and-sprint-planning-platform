using System;
using System.Collections.Generic;
using System.Text;

namespace AgileEstimation.Domain.Exceptions
{
    public sealed class InvalidVoteException : Exception
    {
        public InvalidVoteException(string message)
        : base(message)
        {
        }
    }
}
